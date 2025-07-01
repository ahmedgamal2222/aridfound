export interface Section {
  id: number;
  title: string;
  titleAr: string;
  sectionType: SectionType;
  description: string;
  descriptionAr: string;
  content: string;
  contentAr: string;
  imageUrl: string;
  heroImageUrl: string;
  videoUrl: string;
  pdfUrl: string;
  order: number;
  isActive: boolean;
  showInHomePage: boolean;
  isHeroSection: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Journal specific properties
  issn: string;
  volume: number | null;
  issue: number | null;
  publicationDate: Date | null;
  
  // Contact Us specific properties
  address: string;
  addressAr: string;
  phone: string;
  email: string;
  workingHours: string;
  workingHoursAr: string;
  mapEmbedUrl: string;
  
  // Higher Management specific properties
  position: string;
  positionAr: string;
  
  // Partner specific properties
  websiteUrl: string;
  partnerType: PartnerType | null;
}

export enum SectionType {
  HomePage = 'HomePage',
  AcademicAndResearchEntities = 'AcademicAndResearchEntities',
  OurPartners = 'OurPartners',
  ContactUs = 'ContactUs',
  SadaARIDJournal = 'SadaARIDJournal',
  HigherManagement = 'HigherManagement',
  Media = 'Media',
  Books = 'Books'
}

export enum PartnerType {
  Academic = 'Academic',
  Corporate = 'Corporate',
  Government = 'Government',
  International = 'International'
}