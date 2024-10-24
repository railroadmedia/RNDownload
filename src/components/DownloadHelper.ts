import type { Brand, IDownloading, ILesson, IOfflineContent, IVideo } from '../entity';
import { PIX_RATIO, WINDOW_WIDTH } from '../helper';

export const handleLessonSize = (oc: IOfflineContent, taskId: string, bytes: number): void => {
  if (!oc?.sizeInBytes) {
    oc.sizeInBytes = 0;
  }
  oc.sizeInBytes += bytes;
  oc.fileSizes[taskId] = bytes;
  const sizes = Object.keys(oc.fileSizes);
  if (sizes?.includes('largestFile')) {
    sizes?.splice(sizes.indexOf('largestFile'), 1);
  }
  if (sizes?.some(s => s?.includes('Video'))) {
    oc.fileSizes.largestFile = sizes.reduce((a, b) => (oc.fileSizes[a] > oc.fileSizes[b] ? a : b));
  }
};

export const fetchExpectedBytes = (oc: IOfflineContent, dlding?: IDownloading): void => {
  if (dlding && !oc?.fileSizes[dlding?.id]) {
    oc.fileSizes[dlding.id] = 1;
    fetch(dlding?.url).then((res: any) =>
      handleLessonSize(oc, dlding.id, parseInt(res?.headers?.map?.['content-length'], 10) || 0)
    );
  }
};

export const derefLesson = (
  lesson: ILesson,
  brand: Brand
): ILesson => {
  const result: ILesson = {
    ...lesson,
    brand,
    video: { video_playback_endpoints: lesson?.video?.video_playback_endpoints
      ? hd720OrHighestVideo(lesson.video?.video_playback_endpoints)
      : [] },
    resources: Object.values(lesson?.resources || {})?.map(r => ({
      ...r,
    })),
  };
  if (lesson?.assignments) {
    result.assignments = JSON.parse(JSON.stringify(lesson.assignments));
  }
  return result;
};

const hd720OrHighestVideo = (videos: IVideo[]): IVideo[] => {
  const videoEndpoint = videos
    ?.filter(v => v?.height <= 720)
    ?.filter(v => v?.height <= -~WINDOW_WIDTH * PIX_RATIO)
    ?.sort((a, b) => (a?.height < b.height ? -1 : 1))
    ?.pop();
  return videoEndpoint ? [videoEndpoint] : [];
};
