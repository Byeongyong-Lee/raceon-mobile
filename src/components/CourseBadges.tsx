import React from 'react';
import {Text, View} from 'react-native';

type Props = {
  course: string;
  isPast?: boolean;
};

export default function CourseBadges({course, isPast = false}: Props) {
  const courses = course.split(/[,\/·]/).map(c => c.trim()).filter(Boolean);
  const visible = courses.slice(0, 4);
  const hasMore = courses.length > 4;
  const bgColor = isPast ? '#f3f4f6' : '#ffedd5';
  const textColor = isPast ? '#9ca3af' : '#ea580c';

  return (
    <View className="flex-row flex-wrap items-center" style={{gap: 4}}>
      {visible.map((c, i) => (
        <View key={i} className="rounded-full px-2 py-0.5" style={{backgroundColor: bgColor}}>
          <Text className="text-xs font-semibold" style={{color: textColor}}>{c}</Text>
        </View>
      ))}
      {hasMore && (
        <View className="rounded-full px-2 py-0.5" style={{backgroundColor: bgColor}}>
          <Text className="text-xs font-semibold" style={{color: textColor}}>···</Text>
        </View>
      )}
    </View>
  );
}
