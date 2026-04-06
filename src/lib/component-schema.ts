export const COMPONENT_SCHEMA = `
## Component Architecture

Section components are CONTAINERS with DropZones. Content goes INSIDE them as nested child components.

### Section Containers (use these as top-level content items):

1. HeroSection — wrapper for hero content
   Props: alignment ("left"|"center"|"right"), backgroundColor (hex), textColor (hex), paddingTop/paddingBottom/paddingLeft/paddingRight (e.g. "80px"), marginTop/marginBottom, borderRadius
   DropZone: "hero-content" — place Heading, Text, Button components inside

2. FeatureGrid — wrapper for feature grid layout
   Props: columns ("2"|"3"|"4"), backgroundColor (hex), textColor (hex), padding/margin props, borderRadius
   DropZones: "feature-header" (for section title/subtitle), "feature-items" (for Card components)

3. Testimonials — wrapper for testimonials layout
   Props: layout ("grid"|"carousel"), backgroundColor (hex), textColor (hex), padding/margin props, borderRadius
   DropZones: "testimonial-header" (for section title), "testimonial-items" (for Quote components)

4. CallToAction — wrapper for CTA section
   Props: alignment, backgroundColor (hex), textColor (hex), padding/margin props, borderRadius
   DropZone: "cta-content" — place Heading, Text, Button components inside

5. Container — generic section wrapper
   Props: backgroundColor, padding (top/bottom/left/right), margin, maxWidth, alignment, borderRadius
   DropZone: "content"

### Content Components (place INSIDE section DropZones):

- Heading: text, level ("h1"|"h2"|"h3"|"h4"), color (hex), marginBottom, backgroundColor, borderRadius
- Text: content, size ("sm"|"base"|"lg"|"xl"), color (hex), opacity, marginBottom, maxWidth, backgroundColor, borderRadius
- Button: text, link, variant ("primary"|"secondary"|"outline"), size ("sm"|"md"|"lg"), backgroundColor (hex), textColor (hex), marginTop/marginBottom/marginRight, borderRadius
- Icon: icon ("bolt"|"shield"|"chart"|"clock"|"users"|"cog"|"check"|"star"|"heart"|"rocket"), size, color (hex), backgroundColor (hex), padding, borderRadius, marginBottom
- Quote: text, author, role, company, textColor (hex), backgroundColor (hex), borderRadius
- Card: backgroundColor, padding, borderRadius, border (bool). DropZone: "card-content"

## JSON Structure with Nested Components

Use this EXACT nested format. Section components have zones that contain child components:

{
  "content": [
    {
      "type": "HeroSection",
      "props": {
        "id": "hero-1",
        "alignment": "center",
        "backgroundColor": "#0f172a",
        "textColor": "#ffffff",
        "paddingTop": "80px",
        "paddingBottom": "80px",
        "paddingLeft": "24px",
        "paddingRight": "24px",
        "marginTop": "0px",
        "marginBottom": "0px",
        "borderRadius": "0px"
      }
    },
    {
      "type": "FeatureGrid",
      "props": {
        "id": "features-1",
        "columns": "3",
        "backgroundColor": "#1e293b",
        "textColor": "#ffffff",
        "paddingTop": "80px",
        "paddingBottom": "80px",
        "paddingLeft": "24px",
        "paddingRight": "24px",
        "marginTop": "0px",
        "marginBottom": "0px",
        "borderRadius": "0px"
      }
    }
  ],
  "zones": {
    "hero-1:hero-content": [
      {
        "type": "Heading",
        "props": { "id": "hero-heading", "text": "Your Headline", "level": "h1", "color": "#ffffff", "marginBottom": "24px", "backgroundColor": "transparent", "borderRadius": "0px" }
      },
      {
        "type": "Text",
        "props": { "id": "hero-text", "content": "Your subheadline text", "size": "lg", "color": "#94a3b8", "opacity": "1", "marginBottom": "32px", "maxWidth": "640px", "backgroundColor": "transparent", "borderRadius": "0px" }
      },
      {
        "type": "Button",
        "props": { "id": "hero-cta", "text": "Get Started", "link": "#", "variant": "primary", "size": "lg", "backgroundColor": "#4f46e5", "textColor": "#ffffff", "marginTop": "0px", "marginBottom": "0px", "marginRight": "0px", "borderRadius": "8px" }
      }
    ],
    "features-1:feature-header": [
      {
        "type": "Heading",
        "props": { "id": "features-title", "text": "Features", "level": "h2", "color": "#ffffff", "marginBottom": "16px", "backgroundColor": "transparent", "borderRadius": "0px" }
      }
    ],
    "features-1:feature-items": [
      {
        "type": "Card",
        "props": { "id": "feature-card-1", "backgroundColor": "rgba(255,255,255,0.05)", "padding": "24px", "borderRadius": "12px", "border": false }
      }
    ],
    "feature-card-1:card-content": [
      {
        "type": "Icon",
        "props": { "id": "feature-icon-1", "icon": "bolt", "size": "24px", "color": "#ffffff", "backgroundColor": "#4f46e5", "padding": "12px", "borderRadius": "8px", "marginBottom": "16px" }
      },
      {
        "type": "Heading",
        "props": { "id": "feature-title-1", "text": "Feature Name", "level": "h3", "color": "#ffffff", "marginBottom": "8px", "backgroundColor": "transparent", "borderRadius": "0px" }
      },
      {
        "type": "Text",
        "props": { "id": "feature-desc-1", "content": "Feature description", "size": "base", "color": "#94a3b8", "opacity": "1", "marginBottom": "0px", "maxWidth": "100%", "backgroundColor": "transparent", "borderRadius": "0px" }
      }
    ]
  },
  "root": { "props": {} }
}

IMPORTANT RULES:
- The "zones" key contains ALL nested content. Zone keys use the format "parentId:zoneName".
- Every component MUST have a unique "id" prop.
- Section components (HeroSection, FeatureGrid, etc.) go in "content".
- Child components (Heading, Text, Button, etc.) go in "zones" under their parent's zone key.
- Cards inside FeatureGrid go in "parentId:feature-items", and Card children go in "cardId:card-content".
- Quotes inside Testimonials go in "parentId:testimonial-items".
`;
