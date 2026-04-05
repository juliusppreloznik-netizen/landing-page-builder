import { Config } from "@puckeditor/core";

// Layout Components
import { Container, ContainerProps } from "./components/Container";
import { Grid, GridProps } from "./components/Grid";
import { Card, CardProps } from "./components/Card";
import { ButtonGroup, ButtonGroupProps } from "./components/ButtonGroup";
import { Spacer, SpacerProps } from "./components/Spacer";

// Content Components
import { Heading, HeadingProps } from "./components/Heading";
import { Text, TextProps } from "./components/Text";
import { Button, ButtonProps } from "./components/Button";
import { Icon, IconProps } from "./components/Icon";
import { Quote, QuoteProps } from "./components/Quote";

// Legacy Components (kept for backwards compatibility)
import { HeroSection, HeroSectionProps } from "./components/HeroSection";
import { FeatureGrid, FeatureGridProps } from "./components/FeatureGrid";
import { Testimonials, TestimonialsProps } from "./components/Testimonials";
import { CallToAction, CallToActionProps } from "./components/CallToAction";

type Components = {
  // Layout
  Container: ContainerProps;
  Grid: GridProps;
  Card: CardProps;
  ButtonGroup: ButtonGroupProps;
  Spacer: SpacerProps;
  // Content
  Heading: HeadingProps;
  Text: TextProps;
  Button: ButtonProps;
  Icon: IconProps;
  Quote: QuoteProps;
  // Legacy
  HeroSection: HeroSectionProps;
  FeatureGrid: FeatureGridProps;
  Testimonials: TestimonialsProps;
  CallToAction: CallToActionProps;
};

export const puckConfig: Config<Components> = {
  categories: {
    layout: {
      title: "Layout",
      components: ["Container", "Grid", "Card", "ButtonGroup", "Spacer"],
    },
    content: {
      title: "Content",
      components: ["Heading", "Text", "Button", "Icon", "Quote"],
    },
    sections: {
      title: "Pre-built Sections",
      components: ["HeroSection", "FeatureGrid", "Testimonials", "CallToAction"],
    },
  },
  components: {
    // Layout
    Container,
    Grid,
    Card,
    ButtonGroup,
    Spacer,
    // Content
    Heading,
    Text,
    Button,
    Icon,
    Quote,
    // Legacy
    HeroSection,
    FeatureGrid,
    Testimonials,
    CallToAction,
  },
};

export type { Components };
