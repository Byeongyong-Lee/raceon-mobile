import React, {useRef} from 'react';
import {Dimensions, FlatList, Text, TouchableOpacity, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const MONTH_ITEM_W = Math.floor(SCREEN_WIDTH / 5);
const MONTH_SIDE_PAD = Math.floor((SCREEN_WIDTH - MONTH_ITEM_W) / 2);

type Props = {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
};

export default function YearMonthPicker({year, month, onYearChange, onMonthChange}: Props) {
  const listRef = useRef<FlatList>(null);

  const scrollToMonth = (m: number, animated = true) => {
    listRef.current?.scrollToOffset({offset: (m - 1) * MONTH_ITEM_W, animated});
  };

  const handleMonthPress = (m: number) => {
    scrollToMonth(m);
    onMonthChange(m);
  };

  const handleScrollEnd = (e: {nativeEvent: {contentOffset: {x: number}}}) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / MONTH_ITEM_W);
    onMonthChange(Math.min(12, Math.max(1, idx + 1)));
  };

  return (
    <View className="mb-2">
      <View className="mb-3 flex-row items-center justify-center" style={{gap: 16}}>
        <TouchableOpacity
          onPress={() => onYearChange(year - 1)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="w-20 text-center text-base font-bold text-gray-800">
          {year}년
        </Text>
        <TouchableOpacity
          onPress={() => onYearChange(year + 1)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="chevron-right" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={Array.from({length: 12}, (_, i) => i + 1)}
        horizontal
        keyExtractor={item => String(item)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={MONTH_ITEM_W}
        decelerationRate="fast"
        initialScrollIndex={month - 1}
        contentContainerStyle={{paddingHorizontal: MONTH_SIDE_PAD}}
        getItemLayout={(_, index) => ({
          length: MONTH_ITEM_W,
          offset: MONTH_ITEM_W * index,
          index,
        })}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({item}) => {
          const dist = Math.abs(item - month);
          const isSelected = dist === 0;
          return (
            <TouchableOpacity
              style={{width: MONTH_ITEM_W, alignItems: 'center', paddingVertical: 8}}
              onPress={() => handleMonthPress(item)}
              activeOpacity={0.7}>
              <Text
                style={{
                  fontSize: isSelected ? 16 : dist === 1 ? 14 : 13,
                  fontWeight: isSelected ? '700' : '400',
                  color: isSelected ? '#f97316' : '#9ca3af',
                  opacity: isSelected ? 1 : dist === 1 ? 0.75 : 0.35,
                }}>
                {item}월
              </Text>
              {isSelected && (
                <View
                  style={{
                    marginTop: 4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#f97316',
                  }}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
