import type { ComponentType } from "react";
import type { CSSProperties } from "react";
import type { ContactInquiryTarget } from "@/types/inquiry";
import type { PageSection } from "@/types/page";
import {
  ContactSectionView,
  FaqSectionView,
  FeaturesSectionView,
  FooterSectionView,
  GallerySectionView,
  HeaderSectionView,
  HeroSectionView,
  ImageSectionView,
  PricingSectionView,
  ServicesSectionView,
  TestimonialsSectionView,
  TextSectionView,
} from "./SectionViews";
import { ComposedSectionView } from "./ComposedSectionView";

export type SectionViewProps = {
  section: PageSection;
  style: CSSProperties;
  themeVars: CSSProperties;
  pageSections?: PageSection[];
  inquiryTarget?: ContactInquiryTarget | null;
};

export const sectionViewRegistry: Record<
  PageSection["type"],
  ComponentType<SectionViewProps>
> = {
  HEADER: HeaderSectionView,
  HERO: HeroSectionView,
  TEXT: TextSectionView,
  IMAGE: ImageSectionView,
  SERVICES: ServicesSectionView,
  FEATURES: FeaturesSectionView,
  GALLERY: GallerySectionView,
  TESTIMONIALS: TestimonialsSectionView,
  PRICING: PricingSectionView,
  FAQ: FaqSectionView,
  CONTACT: ContactSectionView,
  FOOTER: FooterSectionView,
  COMPOSED: ComposedSectionView,
};
