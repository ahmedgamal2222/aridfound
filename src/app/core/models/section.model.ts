export enum ViewType {
  HeroImage = 'HeroImage',
  SliderHero = 'SliderHero',
  HtmlBlock = 'HtmlBlock',
  List4Items = 'List4Items',
  List3Items = 'List3Items',
  AutoScroll = 'AutoScroll',
  ArrowScroll = 'ArrowScroll',
  Video = 'Video',
  FixedScroll = 'FixedScroll'
}

// Section Model
export interface Section {
  Id: number;
  Name: string;
  Indx: number;
  IsMenu: boolean;
  IsHomePage: boolean;
  IsFooter: boolean;
  ViewType: ViewType | string; // عشان يدعم backend لو رجّع string
  LanguageId: number | null;
  CreatedAt: Date;
  UpdatedAt: Date;
  Contents: SectionContent[];
}

// SectionContent Model
export interface SectionContent {
  Id: number;
  SectionId: number;
  Subject: string;
  Content: string;
  LanguageId: number | null;
  Image?: string;
  Description?: string;
  Url?: string;
  Order: number;
  IsActive: boolean;
}
