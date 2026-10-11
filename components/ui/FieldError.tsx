import { Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { createStyles } from '@/utils/themedStyles';

/**
 * One field's problem, in the student's words, under the field it belongs to.
 * The same component is used everywhere a form explains itself, so a
 * validation message always looks and reads the same way.
 */
export function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.row}>
      <AlertCircle size={14} color={colors.critical} strokeWidth={2} />
      <Text style={[typeScale.label, styles.text]}>{message}</Text>
    </View>
  );
}

const styles = createStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
  },
  text: {
    flex: 1,
    color: colors.critical,
  },
}));
