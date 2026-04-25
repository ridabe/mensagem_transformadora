export type SermonPoint = {
  id: string;
  title: string;
  content: string;
  order: number;
};

export type WebPublishStatus = 'local_only' | 'published' | 'updated_locally' | 'publish_error' | 'unpublished';

export type SermonNote = {
  id: string;
  userName: string;
  preacherName: string;
  churchName: string;
  sermonDate: string;
  sermonTime?: string;
  sermonTitle: string;
  mainVerse: string;
  secondaryVerses: string[];
  introduction?: string;
  keyPoints: SermonPoint[];
  highlightedPhrases: string[];
  personalObservations?: string;
  practicalApplications?: string;
  conclusion?: string;
  finalSummary?: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  webPublicationId?: string;
  webSlug?: string;
  webUrl?: string;
  webPublishStatus?: WebPublishStatus;
  webPublishedAt?: string;
  webUpdatedAt?: string;
  webLastError?: string;
};
