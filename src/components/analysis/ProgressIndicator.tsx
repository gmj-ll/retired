import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentPage,
  totalPages
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage && styles.activeDot
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 24,
    borderRadius: 4,
  },
});
