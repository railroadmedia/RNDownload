export type Brand = 'drumeo' | 'pianote' | 'guitareo' | 'singeo';

export interface IComment {
  comment: string;
  created_on: string;
  created_on_diff?: string;
  id: number;
  user_id: number;
  is_liked: boolean;
  is_reported_by_viewer: boolean;
  like_count: number;
  replies: IComment[];
  user: {
    display_name: string;
    'fields.profile_picture_image_url': string;
    xp: string;
    xp_level: string;
    rank?: string;
    access_level?: string;
  };
}

export interface ILesson {
  rl: any;
  title: string;
  thumbnail_url: string;
  id: number;
  mobile_app_url: string;
  published_on: string;
  type: string;
  video: {
    type: 'youtube-video' | 'vimeo-video';
    external_id?: string;
    video_playback_endpoints: IVideo[];
  };
  resources: IResource[];
  assignments: IAssignment[];
  comments: IComment[];
  chapters: IChapter[];
  brand: Brand;
  related_lessons?: ILesson[];
  instructor?: ICoach[];
  difficulty?: number;
  style?: string;
  description?: string;
  vimeo_video_id: string;
  instructors: ICoach[];
  youtube_video_id?: string;
}

export interface IVideo {
  file: string;
  height: number;
  width: number;
}

export interface IAssignment {
  id: number;
  title: string;
  description: string;
  soundslice_slug?: string;
  timecode?: string;
  sheet_music_image_url?: IMusicSheet[];
}

export interface IMusicSheet {
  content_id?: number;
  id?: number;
  key?: string;
  value: string;
  whRatio?: number;
}

export interface ICoach {
  id: number;
  name: string;
  biography: string;
  head_shot_picture_url: string;
}

export interface IResource {
  resource_id: number;
  resource_name: string;
  resource_url: string;
  extension: string;
  wasWithoutExtension?: boolean;
  title?: string;
}

export interface IOverview {
  banner_button_url: string;
  brand: string;
  child_count: number;
  coaches: string[];
  completed: false;
  course_position: number;
  description: string;
  id: number;
  instructor: ICoach[];
  is_added_to_primary_playlist: false;
  is_liked_by_current_user: false;
  length_in_seconds: number;
  lesson_count: number;
  lessons: ILesson[];
  like_count: number;
  mobile_app_url: string;
  next_lesson: ILesson;
  progress_percent: number;
  published_on: string;
  started: false;
  thumbnail_url: string;
  title: string;
  total_xp: number;
  type: string;
  url: string;
  xp: number;
  difficulty?: number;
  style?: string;
}

export interface IDownloading {
  destination: string;
  id: string;
  url: string;
  headers?: {
    map: { 'content-length': number };
  };
}

export interface IOfflineContent {
  entity?: any;
  fileSizes: any;
  dlded: string[];
  dlding: IDownloading[];
  id: number;
  sizeInBytes: number;
  lesson?: ILesson;
  overview?: IOverview;
}

export interface IChapter {
  id: string;
  chapter_timecode: number;
  chapter_description: string;
  chapter_thumbnail_url: string;
}
