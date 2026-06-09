import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, ScrollView, Text, View} from 'react-native';

type Ad = {id: string; title: string; subtitle: string; bgColor: string};

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const AD_WIDTH = SCREEN_WIDTH - 32;

const ADS: Ad[] = [
  {id: '1', title: '2026 서울마라톤 접수중', subtitle: '3월 15일 · 광화문 출발', bgColor: '#f97316'},
  {id: '2', title: '러닝 기어 특가 세일', subtitle: '최대 40% 할인 · 오늘만', bgColor: '#3b82f6'},
  {id: '3', title: '초보 러너 훈련 가이드', subtitle: '12주 완성 프로그램 무료 제공', bgColor: '#10b981'},
];

export default function AdSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(AD_WIDTH);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % ADS.length;
        scrollRef.current?.scrollTo({x: next * sliderWidth, animated: true});
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [sliderWidth]);

  return (
    <View className="mx-4 mb-3 overflow-hidden rounded-2xl" style={{height: 140}}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={e => setSliderWidth(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={e =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / sliderWidth))
        }>
        {ADS.map(ad => (
          <View
            key={ad.id}
            style={{width: sliderWidth, backgroundColor: ad.bgColor}}
            className="items-center justify-center px-8">
            <Text className="text-center text-xl font-bold text-white">{ad.title}</Text>
            <Text
              className="mt-2 text-center text-sm text-white"
              style={{opacity: 0.85}}>
              {ad.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View
        className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center"
        style={{gap: 6}}>
        {ADS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIndex ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'white',
              opacity: i === activeIndex ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}
