import React, { FunctionComponent, ReactElement, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StyleProp } from 'react-native';
import { zip, mp3, mp4, pdf } from '../img/svgs';
import { FONT_MULTIPLIER } from '../helper';
import type { IResource } from '../entity';
import { downloadRes } from './downloadRes';

const renderSvgs = (extension: string, color: string): ReactElement | undefined => {
  const svgStyle = {
    height: 18,
    width: 18,
    fill: color || 'white',
  };
  switch (extension) {
    case 'zip':
      return zip(svgStyle);
    case 'mp3':
      return mp3(svgStyle);
    case 'mp4':
      return mp4(svgStyle);
    case 'pdf':
      return pdf(svgStyle);
  }
};

export interface IDownloadResources {
  lessonTitle: string;
  resources: IResource[];
  isConnected: boolean | null;
  onClose: () => void;
  showNoConnectionAlert: () => void;
  styles: {
    container?: StyleProp<any>;
    touchableTextResourceNameFontFamily: string;
    touchableTextResourceExtensionFontFamily: string;
    touchableTextResourceCancelFontFamily: string;
    borderColor: string;
    color: string;
  };
  onResourcePressed?: (resource: any) => void;
}

const DownloadResources: FunctionComponent<IDownloadResources> = ({
  resources,
  styles: propStyle,
  lessonTitle,
  isConnected,
  onClose,
  showNoConnectionAlert,
  onResourcePressed,
}) => {
  const onDownloadRes = useCallback(
    async (resource: IResource, index: number) => {
      onClose();
      onResourcePressed?.(resource);
      downloadRes(
        resource,
        lessonTitle,
        index,
        false,
        false,
        false,
        !!isConnected,
        showNoConnectionAlert
      );
    },
    [lessonTitle, isConnected, showNoConnectionAlert, onClose, onResourcePressed]
  );

  return (
    <View style={propStyle?.container}>
      <ScrollView>
        {resources &&
          resources?.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.resourceContainer,
                {
                  borderBottomColor: propStyle?.borderColor,
                },
              ]}
              onPress={() => onDownloadRes(resource, index)}
            >
              <View style={styles.resourceView}>
                <View style={styles.iconCont}>
                  {renderSvgs(resource?.extension, propStyle?.color)}
                </View>

                <Text
                  maxFontSizeMultiplier={FONT_MULTIPLIER}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={[
                    styles.resourceText,
                    {
                      color: propStyle?.color || 'white',
                      fontFamily: propStyle?.touchableTextResourceNameFontFamily,
                    },
                  ]}
                >
                  {resource?.resource_name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  resourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  resourceView: {
    flexDirection: 'row',
  },
  iconCont: {
    marginRight: 15,
  },
  resourceText: {
    fontSize: 14,
    width: '75%',
  },
});

export default DownloadResources;
