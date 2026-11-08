<script module lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { unified, type PluggableList } from 'unified';
  import remarkParse from 'remark-parse';
  import remarkRehype from 'remark-rehype';
  import remarkBreaks from 'remark-breaks';
  import remarkDirective from 'remark-directive';
  import remarkGfm from 'remark-gfm';
  import { find, html, svg } from 'property-information';

  export type MarkdownComponent = Component<any>;
  type DirectiveProps = { children?: string } & Record<string, unknown>;
  export interface MarkdownDirective<T extends DirectiveProps = DirectiveProps> {
    (props: T): string;
    directiveName: string;
    render: MarkdownComponent;
  }
  export type MarkdownProps = {
    children: string;
    directives?: MarkdownDirective<any>[];
    includeMath?: boolean;
    breakNewLines?: boolean;
    components?: Record<string, MarkdownComponent>;
    remarkPlugins?: PluggableList;
    rehypePlugins?: PluggableList;
    allowedElements?: string[];
    disallowedElements?: string[];
    urlTransform?: (url: string, key?: string, node?: any) => string | null | undefined;
    skipHtml?: boolean;
    className?: string;
    copyableCodeBlocks?: boolean;
  };
  type Node = { type: string; tagName?: string; value?: string; properties?: Record<string, any>; children?: Node[]; [key: string]: any };
  const supportsLookbehind = (() => {try {new RegExp('(?<=a)b');return true;} catch {return false;}})();
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const URL_PROPS = new Set(['href','src','cite','action','formAction','poster','longDesc','data','background']);
  const SVG_TAGS = new Set(['svg','path','g','line','rect','circle','ellipse','polygon','polyline','use']);
  type MathPlugins={remarkPlugins: PluggableList; rehypePlugins: PluggableList};
  let mathCache: MathPlugins | null = null;
  let mathPromise: Promise<MathPlugins> | null = null;
  async function loadMathDeps() {
    if (mathCache) return mathCache;
    if (mathPromise) return mathPromise;
    mathPromise = (async () => {
      const [{default:remarkMath},{default:rehypeKatex}] = await Promise.all([import('remark-math'),import('rehype-katex')]);
      mathCache = {remarkPlugins:[[remarkMath,{singleDollarTextMath:false}]],rehypePlugins:[rehypeKatex]};
      return mathCache;
    })();
    try {return await mathPromise;} catch(error) {mathPromise=null;throw error;}
  }
  export function defaultUrlTransform(url: string) {
    if (url.startsWith('tel:') || url.startsWith('sms:')) return url;
    const colon=url.indexOf(':');
    const question=url.indexOf('?');
    const hash=url.indexOf('#');
    const slash=url.indexOf('/');
    return colon<0 || (slash>=0 && colon>slash) || (question>=0 && colon>question) || (hash>=0 && colon>hash) || /^(https?|ircs?|mailto|xmpp)$/i.test(url.slice(0,colon)) ? url : '';
  }
  function encodeBase64(value: unknown) {
    return btoa(Array.from(new TextEncoder().encode(JSON.stringify(value)), byte=>String.fromCharCode(byte)).join(''));
  }
  function decodeBase64(value: string) {
    try {return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value),char=>char.charCodeAt(0))));} catch {return {};}
  }
  export function createMarkdownDirective<T extends DirectiveProps>({render,name,mode}: {render:MarkdownComponent;name:string;mode:'inline'|'block'}): MarkdownDirective<T> {
    const prefix=`OaiMdDirective_${name}`;
    const suffix=typeof crypto!=='undefined' && crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint8Array(6)),v=>(v%36).toString(36)).join('') : Math.random().toString(36).slice(2,8);
    const uniqueName=prefix+suffix;
    const directive=((props:T)=>{
      const {children,...attributes}=props;
      const attrs=`attrs="${encodeBase64(attributes)}"`;
      const leader=mode==='inline'?' :':'\n\n:::';
      return `${leader}${uniqueName}${children?`[${children}]`:''}{${attrs}}`;
    }) as MarkdownDirective<T>;
    directive.directiveName=uniqueName;
    directive.render=render;
    return directive;
  }
  export function reactMarkdownRemarkDirective() {
    return (tree: Node) => {
      function walk(node: Node) {
        if (['textDirective','leafDirective','containerDirective'].includes(node.type)) node.data={hName:node.name,hProperties:node.attributes,...node.data};
        node.children?.forEach(walk);
      }
      walk(tree);
    };
  }
  function text(node?: Node): string {return node?.type==='text' ? node.value ?? '' : (node?.children??[]).map(text).join('');}
</script>

<script lang="ts">
  let { children, directives, includeMath=false, breakNewLines=false, components,
    remarkPlugins, rehypePlugins, allowedElements, disallowedElements, skipHtml,
    urlTransform=defaultUrlTransform, className, copyableCodeBlocks=true }: MarkdownProps = $props();
  let mathReady=$state(!!mathCache);
  let copied=$state<string | null>(null);
  let copyError=$state<{id:string;message:string;code:string} | null>(null);
  let mathError=$state<string | null>(null);
  let mathAttempt=$state(0);
  let resetCopy:ReturnType<typeof setTimeout> | undefined;
  $effect(()=>{
    if(!includeMath || mathReady) return;
    void mathAttempt;
    let alive=true;
    mathError=null;
    void loadMathDeps().then(()=>{if(alive)mathReady=true;}).catch((error)=>{if(alive)mathError=error instanceof Error?error.message:String(error);});
    return ()=>{alive=false;};
  });
  $effect(()=>()=>{clearTimeout(resetCopy);});
  const tree=$derived.by(()=>{
    const math=includeMath && mathReady && mathCache ? mathCache : {remarkPlugins:[],rehypePlugins:[]};
    const processor=unified().use(remarkParse).use(remarkDirective).use(reactMarkdownRemarkDirective);
    processor.use(math.remarkPlugins);
    if(breakNewLines)processor.use(remarkBreaks);
    if(supportsLookbehind)processor.use(remarkGfm,{singleTilde:false});
    processor.use(remarkPlugins??[]);
    const pipeline=processor.use(remarkRehype,{allowDangerousHtml:true}).use(rehypePlugins??[]).use(math.rehypePlugins);
    return pipeline.runSync(pipeline.parse(children)) as Node;
  });
  function isAllowed(tag:string) {return (!allowedElements || allowedElements.includes(tag)) && !disallowedElements?.includes(tag);}
  function properties(node: Node, commonStyles = true) {
    const attrs:Record<string,any>={};
    for(const [key,original] of Object.entries(node.properties??{})) {
      if(/^on/i.test(key) || key==='innerHTML' || key==='outerHTML' || key==='srcDoc')continue;
      const info=find(SVG_TAGS.has(node.tagName??'')?svg:html,key);
      let value=original;
      if(URL_PROPS.has(key) && typeof value==='string')value=urlTransform(value,key,node)??undefined;
      if(Array.isArray(value))value=value.join(info.commaSeparated?', ':' ');
      if(value===null || value===undefined)continue;
      attrs[info.attribute]=value;
    }
    if(commonStyles && node.tagName==='code')attrs.class=['InlineCode',attrs.class].filter(Boolean).join(' ');
    if(commonStyles && node.tagName==='a')attrs.class=['TextLink',attrs.class].filter(Boolean).join(' ');
    return attrs;
  }
  function classText(value:unknown) {return Array.isArray(value)?value.join(' '):typeof value==='string'?value:undefined;}
  function customProps(node:Node) {
    const attrs=properties(node,false);
    const directive=directives?.find(item=>item.directiveName===node.tagName);
    const decoded=directive && typeof node.properties?.attrs==='string' ? decodeBase64(node.properties.attrs) : {};
    return {...attrs,...decoded,className:attrs.class,node};
  }
  async function copy(code:string,index:string) {
    copyError=null;
    try {
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(code);
      else {
        const previous=document.activeElement as HTMLElement|null;
        const area=document.createElement('textarea');area.value=code;area.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.appendChild(area);
        try{area.select();if(!document.execCommand('copy'))throw new Error('Clipboard is unavailable in this browser context.');}finally{area.remove();previous?.focus();}
      }
      copied=index;clearTimeout(resetCopy);resetCopy=setTimeout(()=>copied=null,1300);
    } catch(error) {
      copied=null;
      copyError={id:index,message:error instanceof Error?error.message:String(error),code};
    }
  }
  function selectCode(node:HTMLTextAreaElement) {node.focus();node.select();}
</script>

{#snippet renderNodes(nodes: Node[], parentTag = '', prefix = '')}
  {#each nodes as node, index}
    {@const identity=prefix+':'+index}
    {#if node.type==='text'}
      {#if parentTag==='td' && node.value==='<br>'}<br/>{:else}{node.value}{/if}
    {:else if node.type==='raw'}
      {#if !skipHtml}{#if parentTag==='td' && node.value==='<br>'}<br/>{:else}{node.value}{/if}{/if}
    {:else if node.type==='element' && node.tagName && isAllowed(node.tagName)}
      {@const Custom=directives?.find(item=>item.directiveName===node.tagName)?.render ?? components?.[node.tagName]}
      {#if Custom}
        <Custom {...customProps(node)}>{@render renderNodes(node.children??[],node.tagName,identity)}</Custom>
      {:else if node.tagName==='pre'}
        {@const code=text(node).replace(/\n$/g,'')}
        {@const codeNode=node.children?.find(child=>child.tagName==='code')}
        {@const language=(classText(codeNode?.properties?.className)??'').match(/language-(.*)$/)?.[1]??'text'}
        <div class="CodeBlock">
          {#if copyableCodeBlocks}<div class="CodeBlockHeader"><span>{language}</span><button type="button" onclick={()=>copy(code,identity)}>{copied===identity?'Copied!':copyError?.id===identity?'Copy failed':'Copy'}</button></div>
            {#if copyError?.id===identity}<div class="CodeBlockError" role="alert"><span>Copy failed: {copyError.message} Select the code below and press Ctrl+C / Cmd+C.</span><textarea readonly use:selectCode>{copyError.code}</textarea><button type="button" onclick={()=>copyError=null}>Dismiss</button></div>{/if}{/if}
          <pre class={classText(node.properties?.className)}><code class={`language-${language}`}>{code}</code></pre>
        </div>
      {:else if VOID.has(node.tagName)}
        <svelte:element this={node.tagName} {...properties(node)}/>
      {:else}
        <svelte:element this={node.tagName} {...properties(node)}>{@render renderNodes(node.children??[],node.tagName,identity)}</svelte:element>
      {/if}
    {/if}
  {/each}
{/snippet}

<div class={['MarkdownContent',className].filter(Boolean).join(' ')}>{#if includeMath && !mathReady}{#if mathError}<div class="MathStatus error" role="alert"><span>Math rendering failed to load: {mathError}</span><button type="button" onclick={()=>mathAttempt++}>Retry</button></div>{:else}<div class="MathStatus" role="status">Loading math rendering…</div>{/if}{/if}{@render renderNodes(tree.children??[])}</div>

<style>
@layer markdown-defaults {
 .MarkdownContent {
  --font-weight-semibold:600;--font-weight-medium:500;--font-weight-normal:400;
  --color-text:#202123;--color-text-secondary:#6b6b6b;--color-border:#ddd;--color-border-strong:#bbb;
  --font-text-sm-line-height:1.5;--radius-2xs:2px;--tw-prose-quotes:var(--color-text);
  --alpha-04:rgb(0 0 0 / 4%);--alpha-08:rgb(0 0 0 / 8%);--alpha-10:rgb(0 0 0 / 10%);--alpha-15:rgb(0 0 0 / 15%);--alpha-20:rgb(0 0 0 / 20%);
  --markdown-code-background:#f2f2f2;--markdown-code-header:#e9e9e9;
 }
 :global([data-theme="dark"]) .MarkdownContent {
  --color-text:#ececec;--color-text-secondary:#aaa;--color-border:#3a3a3a;--color-border-strong:#555;
  --alpha-04:rgb(255 255 255 / 4%);--alpha-08:rgb(255 255 255 / 8%);--alpha-10:rgb(255 255 255 / 10%);--alpha-15:rgb(255 255 255 / 15%);--alpha-20:rgb(255 255 255 / 20%);
  --markdown-code-background:#242424;--markdown-code-header:#2d2d2d;
 }
}
.MarkdownContent {
 overflow-wrap:anywhere;
}
/* Descendants are produced from HAST and snippets, so preserve their reach. */
.MarkdownContent :global {
 *:first-child {margin-top:0;}
 *:last-child {margin-bottom:0;}
 h1 {margin-bottom:0.5rem;font-size:1.75em;font-weight:var(--font-weight-semibold);letter-spacing:-0.04rem;line-height:1.222;}
 h2 {margin-top:2rem;margin-bottom:1rem;font-size:1.5em;font-weight:var(--font-weight-semibold);line-height:1.222;}
 h3 {margin-top:1.125rem;margin-bottom:0.625rem;font-size:1.25em;font-weight:var(--font-weight-semibold);line-height:1.3;}
 h4 {margin-top:1rem;margin-bottom:0.5rem;font-size:1em;font-weight:var(--font-weight-semibold);line-height:1.5;}
 h5 {font-size:1em;font-weight:var(--font-weight-semibold);line-height:1.5;}
 h6 {font-size:1em;line-height:1.5;}
 ul,ol {
  margin:0.5em 0 1em;
  >li>:first-child {margin-top:0;margin-bottom:0;}
  >li ul,>li ol {margin-top:0.25em!important;}
 }
 ul {
  padding-left:1.625em;list-style-type:disc;
  >li {padding-left:0.375em;margin:0.5em 0;&::marker{color:var(--color-text-secondary);font-size:1em;font-weight:var(--font-weight-medium);}}
 }
 ol {
  padding-left:1.625em;list-style-type:decimal;
  >li {padding-left:0.375em;margin:0.5em 0;&::marker{color:var(--color-text-secondary);font-size:1em;font-weight:var(--font-weight-medium);}}
 }
 li {min-height:1.5em;margin:0.5em 0;}
 p {margin:1em 0;}
 strong {font-weight:var(--font-weight-semibold);}
 em {font-style:italic;}
 blockquote {
  position:relative;padding-top:0.25em;padding-bottom:0.25rem;padding-left:1.5rem;
  color:var(--tw-prose-quotes);font-weight:var(--font-weight-normal);quotes:"\201C" "\201D" "\2018" "\2019";
  &::before {position:absolute;top:0;bottom:0;left:0;display:block;width:0.25rem;border-radius:var(--radius-2xs);background:light-dark(var(--alpha-15),var(--alpha-20));content:"";}
  p {margin:0.5em 0 0;&:first-child{margin-top:0;}}
 }
 hr {border-color:var(--alpha-10);border-top-width:1px;margin-top:2em;margin-bottom:2em;}
 table {width:100%;border:0;margin-top:2em;margin-bottom:2em;border-collapse:separate;font-size:0.875em;line-height:1.7142857;table-layout:auto;}
 th {
  border:0;border-bottom:1px solid var(--color-border-strong);line-height:var(--font-text-sm-line-height);padding-block:0.5rem;padding-inline:0.5rem;text-align:start;
  &:first-child{padding-inline-start:0;}&:last-child{padding-inline-end:0;}
 }
 td {
  border:0;border-bottom:1px solid var(--color-border);padding-block:0.625rem;padding-inline:0.5rem;
  &:first-child{padding-inline-start:0;}&:last-child{padding-inline-end:0;}
 }
 tbody tr:last-child {td{border-bottom:0;}}
 .InlineCode {padding:1px 0.3rem;border-radius:0.25rem;background-color:light-dark(var(--alpha-04),var(--alpha-10));box-shadow:inset 0 0 0 1px var(--alpha-08);color:inherit;font-size:0.875em;font-weight:500;}
}
/* Approximations of missing CodeBlock and TextLink styles. */
.CodeBlock {margin:1em 0;border-radius:12px;overflow:hidden;background:var(--markdown-code-background);}
.CodeBlockHeader {display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 14px;background:var(--markdown-code-header);color:var(--color-text-secondary);font-size:12px;}
.CodeBlockHeader button {border:0;background:transparent;color:inherit;cursor:pointer;font:inherit;padding:3px 8px;border-radius:9999px;}
.CodeBlockHeader button:hover {background:var(--alpha-08);}
.CodeBlock pre {padding:16px;margin:0;overflow:auto;}
.CodeBlock code {font-family:Arial,Helvetica,sans-serif;font-size:0.875em;}
.CodeBlockError {display:flex;flex-direction:column;gap:8px;padding:10px 14px;color:var(--danger,#c4372b);font-size:12px;}
.CodeBlockError textarea {width:100%;height:96px;resize:vertical;border:0;border-radius:8px;padding:8px;font:12px/1.5 Arial,Helvetica,sans-serif;background:var(--alpha-04);color:var(--color-text);}
.CodeBlockError button,.MathStatus button {align-self:flex-start;border:0;background:var(--alpha-08);color:inherit;cursor:pointer;font:inherit;padding:4px 12px;border-radius:9999px;}
.MathStatus {display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 1em;font-size:13px;color:var(--color-text-secondary);}
.MathStatus.error {color:var(--danger,#c4372b);}
.MarkdownContent {font-family:Arial,Helvetica,sans-serif;color:var(--color-text);}
.MarkdownContent :global(.TextLink) {color:inherit;text-decoration:underline;text-underline-offset:3px;}
</style>
