import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/constants/colors';
import { textCorners } from '@/constants/layout';
import { fontFamily } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PrimaryButton, TextButton } from '@/components/ui/Buttons';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/hooks/useCampusData';
import { useAppStore } from '@/stores/appStore';
import { haptics } from '@/utils/haptics';

/**
 * Edit profile. Each field is its own labelled block — a label, then the
 * field itself — so nothing is a box drawn inside another box.
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const user = useUser();
  const updateUser = useAppStore((state) => state.updateUser);

  const [name, setName] = useState(user.name);
  const [degree, setDegree] = useState(user.degree);
  const [university, setUniversity] = useState(user.university);
  const [campusId, setCampusId] = useState(user.campusId);

  const canSave = name.trim().length > 1;

  const save = () => {
    if (!canSave) return;
    updateUser({
      name: name.trim(),
      degree: degree.trim(),
      university: university.trim(),
      campusId: campusId.trim(),
    });
    haptics.success();
    router.back();
  };

  return (
    <Screen back section="Edit profile">
      <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" autoFocus />
      <Field
        label="Degree"
        value={degree}
        onChangeText={setDegree}
        placeholder="B.Tech CSE"
      />
      <Field
        label="University"
        value={university}
        onChangeText={setUniversity}
        placeholder="University name"
      />
      <Field
        label="Campus ID"
        value={campusId}
        onChangeText={setCampusId}
        placeholder="dsu-main"
        autoCapitalize="none"
      />

      <PrimaryButton label="Save changes" onPress={save} disabled={!canSave} style={styles.save} />
      <TextButton label="Cancel" onPress={() => router.back()} style={styles.cancel} />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoFocus,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  return (
    <View style={styles.field}>
      <SectionLabel style={styles.label}>{label}</SectionLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        selectionColor={colors.primary}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        style={[textCorners('block'), styles.input]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 7,
  },
  input: {
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 14.5,
    outlineWidth: 0,
  },
  save: {
    marginTop: 8,
  },
  cancel: {
    marginTop: 4,
  },
});
