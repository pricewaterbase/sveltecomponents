use crate::Icon;

/// Return portable SVG only. Svelte is the app's frontend, not an export format.
pub fn generate_code(icon: &Icon) -> String {
    icon.svg.clone()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_svg_is_valid_and_generation_preserves_geometry() {
        let icons: Vec<Icon> = serde_json::from_str(include_str!("../data/icons.json")).unwrap();
        assert_eq!(icons.len(), 755);
        for icon in icons {
            let svg = generate_code(&icon);
            roxmltree::Document::parse(&svg).unwrap();
            assert_eq!(svg, icon.svg);
        }
    }

}
