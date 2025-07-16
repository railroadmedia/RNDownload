// eslint-disable-next-line react-native/split-platform-components
import { Alert, DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { IS_IOS } from '../helper';
import type { IResource } from '../entity';

const getTypeByExtension = (path: string): string | undefined => {
  if (path === 'mp3' || path?.indexOf('mp3') > 0) {
    return 'audio/mp3';
  }
  if (path === 'pdf' || path?.indexOf('pdf') > 0) {
    return 'application/pdf';
  }
  if (path === 'zip' || path?.indexOf('zip') > 0) {
    return 'application/zip';
  }
};

export async function hasStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = Number(Platform.Version);

  if (apiLevel >= 29) {
    // Android 10 and above: writing to app-specific directories needs no permission
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const hasPermission = await PermissionsAndroid.check(permission);

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission,
    {
      title: 'Write to external Storage',
      message: 'For downloading resources we need your permission',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
  return status === PermissionsAndroid.RESULTS.GRANTED;
}

export const downloadRes = (
  resource: IResource,
  lessonTitle: string,
  id: number,
  notEmmitingProgress: boolean,
  notOppeningAfterDld: boolean,
  cancel: boolean,
  isConnected: boolean,
  showNoConnectionAlert: () => void
): Promise<void> | undefined => {
  if (cancel) {
    return;
  }
  return new Promise<void>(async (resolve, reject) => {
    let resourceUrl: string;
    if (decodeURI(resource?.resource_url) === resource?.resource_url) {
      resourceUrl = encodeURI(resource?.resource_url);
    } else {
      resourceUrl = resource?.resource_url;
    }
    const dirs = ReactNativeBlobUtil.fs.dirs;
    const resExtension = resource?.resource_url?.split('.').pop()?.toLowerCase();
    const decodedUrl = decodeURI(resourceUrl);
    const resourceId = decodedUrl?.substring(
      decodedUrl.lastIndexOf('/') + 1,
      decodedUrl.lastIndexOf('.')
    );

    const filePath = IS_IOS
      ? `${dirs.DocumentDir}/${lessonTitle?.replace(
          /[&\/\\#,+()$~%.,^'":*?!|<>{}]/g,
          ''
        )}/${resourceId}.${resExtension ?? ''}`
      : `${dirs.DownloadDir}/${lessonTitle?.replace(
          /[&\/\\#,+()$~%.,^'":*?!|<>{}]/g,
          ''
        )}/${resourceId}.${resExtension ?? ''}`;

    const exists = await ReactNativeBlobUtil.fs.exists(filePath);

    if (exists) {
      resolve();
      if (!notOppeningAfterDld) {
        if (IS_IOS) {
          setTimeout(() => ReactNativeBlobUtil.ios.openDocument(filePath), 1000);
        } else {
          const mimeType = getTypeByExtension(filePath);
          if (mimeType) {
            ReactNativeBlobUtil.android.actionViewIntent(filePath, mimeType);
          }
        }
      }
    } else {
      if (!isConnected) {
        return showNoConnectionAlert();
      }
      if (IS_IOS) {
        try {
          const fetchConf = ReactNativeBlobUtil.config({
            fileCache: true,
            path: filePath,
          });

          fetchConf
            .fetch('GET', resourceUrl)
            .progress((received: string, total: string) => {
              if (!notEmmitingProgress) {
                DeviceEventEmitter.emit('dldProgress', {
                  id,
                  val: parseInt(received, 10) / parseInt(total, 10),
                });
              }
            })
            .then((res: { data: string }) => {
              resolve();
              if (!notEmmitingProgress) {
                DeviceEventEmitter.emit('dldProgress', {
                  id,
                  val: undefined,
                });
              }
              if (!getTypeByExtension(filePath)) {
                ReactNativeBlobUtil.fs
                  .mv(res.data, `${res.data}${resExtension}`)
                  .then(() => {
                    if (!notOppeningAfterDld) {
                      ReactNativeBlobUtil.ios.openDocument(`${res.data}${resExtension}`);
                    }
                  })
                  .catch(() => {
                    reject();
                  });
              } else if (!notOppeningAfterDld) {
                ReactNativeBlobUtil.ios.openDocument(res.data);
              }
            })
            .catch(() => {
              reject();
              Alert.alert(
                `Error while downloading ${resource?.resource_name}`,
                'There is insufficient storage space on your device. Please free up some space and try again.',
                [{ text: 'OK' }],
                { cancelable: false }
              );
              ReactNativeBlobUtil.fs.unlink(filePath);
            });
        } catch (e) {
          resolve();
        }
      } else {
        try {
          if (await hasStoragePermission()) {
            ReactNativeBlobUtil.fs.df().then(info => {
              const { free, internal_free, external_free } = info;
              const freeSpaceInMb =
                (free || Math.max(Number(internal_free), Number(external_free))) / 1024 / 1024;
              let hasSpace = false;
              if (
                (resExtension === 'pdf' && freeSpaceInMb > 1) ||
                (resExtension !== 'pdf' && freeSpaceInMb > 100)
              ) {
                hasSpace = true;
              }
              if (hasSpace) {
                try {
                  const options = {
                    fileCache: true,
                    addAndroidDownloads: {
                      useDownloadManager: true,
                      notification: true,
                      path: filePath,
                      title: resource?.resource_name,
                      description: 'Downloading',
                    },
                  };
                  const fetchConf = ReactNativeBlobUtil.config(options);
                  fetchConf
                    .fetch('GET', resourceUrl)
                    .then(() => {
                      resolve();
                      if (!notOppeningAfterDld) {
                        const extension = getTypeByExtension(resExtension || '');
                        if (resource?.wasWithoutExtension) {
                          ReactNativeBlobUtil.fs
                            .mv(filePath, `${filePath}${resExtension}`)
                            .then(() => {
                              if (extension) {
                                ReactNativeBlobUtil.android.actionViewIntent(
                                  `${filePath}${resExtension}`,
                                  extension
                                );
                              }
                            })
                            .catch(() => {
                              reject();
                            });
                        } else {
                          if (extension) {
                            ReactNativeBlobUtil.android.actionViewIntent(filePath, extension);
                          }
                        }
                      }
                    })
                    .catch(() => {
                      reject();
                    });
                } catch (e) {
                  resolve();
                }
              } else {
                resolve();
                Alert.alert(
                  `Error while downloading ${resource?.resource_name}`,
                  'There is insufficient storage space on your device. Please free up some space and try again.',
                  [{ text: 'OK' }],
                  { cancelable: false }
                );
              }
            });
          }
        } catch (err) {
          resolve();
        }
      }
    }
  });
};
