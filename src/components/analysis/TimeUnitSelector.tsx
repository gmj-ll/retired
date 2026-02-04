import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TimeUnitSelectorProps {
  selectedUnit: 'years' | 'months' | 'days' | 'hours' | 'minutes';
  onUnitChange: (unit: 'years' | 'months' | 'days' | 'hours' | 'minutes') => void;
  availableUnits?: ('years' | 'months' | 'days' | 'hours' | 'minutes')[];
}

const unitLabels = {
  years: '年',
  months: '月',
  days: '日',
  hours: '时',
  minutes: '分'
};

export const TimeUnitSelector: React.FC<TimeUnitSelectorProps> = ({
  selectedUnit,
  onUnitChange,
  availableUnits = ['years', 'months', 'days', 'hours', 'minutes']
}) => {
  return (
    <View style={styles.container}>
      {availableUnits.map((unit) => (
        <TouchableOpacity
          key={unit}
          style={[
            styles.unitButton,
            selectedUnit === unit && styles.selectedUnit
          ]}
          onPress={() => onUnitChange(unit)}
        >
          <Text style={[
            styles.unitText,
            selectedUnit === unit && styles.selectedUnitText
          ]}>
            {unitLabels[unit]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 4,
    marginVertical: 10,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  selectedUnit: {
    backgroundColor: '#007AFF',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedUnitText: {
    color: 'white',
    fontWeight: '600',
  },
});
