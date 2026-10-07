import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import { BrandMark } from '@/components/ui/BrandMark';
import * as ImagePicker from 'expo-image-picker';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  Check,
  IdCard,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { textCorners } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui/Buttons';
import { Card, CardSection, Pill } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useAppStore } from '@/stores/appStore';
import { useSessionStore } from '@/stores/sessionStore';
import { haptics } from '@/utils/haptics';
import {
  campusFromEmail,
  emailProblem,
  isCollegeEmail,
  isUsn,
  makeVerificationCode,
  normaliseUsn,
  usnProblem,
} from '@/utils/identity';
import { createStyles } from '@/utils/themedStyles';

const RESEND_SECONDS = 30;

type Step = 1 | 2 | 3;
type Phase = 'form' | 'checking' | 'verified';

/**
 * Student sign-in.
 *
 * There is no sign-up: a CampusNow account exists because a campus IT office
 * created one, so the app proves three things instead of creating anything —
 * the college email is real, the student can read it, and the USN on the ID
 * card matches a seat number issued by that campus.
 */
export default function SignInScreen() {
  const signIn = useSessionStore((state) => state.signIn);
  const updateUser = useAppStore((state) => state.updateUser);

  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>('form');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const codeRef = useRef<TextInput>(null);

  const emailError = emailProblem(email);
  const usnError = usnProblem(usn);
  const canVerify = name.trim().length > 2 && isUsn(usn) && Boolean(idPhoto);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (phase !== 'checking') return;
    const step1 = setTimeout(() => setPhase('verified'), 900);
    return () => clearTimeout(step1);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'verified') return;
    const finish = setTimeout(() => {
      signIn({ email, usn: normaliseUsn(usn), name, idPhotoUri: idPhoto });
      // The name the student verified is the name every report is signed with.
      updateUser({ name: name.trim() });
    }, 700);
    return () => clearTimeout(finish);
  }, [phase, signIn, updateUser, email, usn, name, idPhoto]);

  const sendCode = useCallback(() => {
    if (!isCollegeEmail(email)) return;
    haptics.success();
    setSentCode(makeVerificationCode());
    setCode('');
    setSeconds(RESEND_SECONDS);
    setStep(2);
    setTimeout(() => codeRef.current?.focus(), 350);
  }, [email]);

  const checkCode = useCallback(() => {
    if (code.length < 6) return;
    haptics.select();
    setStep(3);
  }, [code]);

  const pickId = useCallback(async (source: 'library' | 'camera') => {
    setPhotoBusy(true);
    try {
      const permission =
        source === 'library'
          ? await ImagePicker.requestMediaLibraryPermissionsAsync()
          : await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result =
        source === 'library'
          ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 })
          : await ImagePicker.launchCameraAsync({ quality: 0.6 });

      if (result.canceled || !result.assets?.[0]) return;
      setIdPhoto(result.assets[0].uri);
    } catch {
      // A missing camera or library must never block verification.
    } finally {
      setPhotoBusy(false);
    }
  }, []);

  if (phase !== 'form') {
    return <Verifying phase={phase} />;
  }

  return (
    <Screen header={false} scroll>
      <View style={styles.brand}>
        <BrandMark width={30} height={26} />
        <Text style={styles.brandName}>CampusNow</Text>
        <Pill>Student access</Pill>
      </View>

      <Stepper step={step} />

      <Text style={[typeScale.hero, styles.title]}>{TITLES[step]}</Text>
      <Text style={[typeScale.body, styles.lede]}>{LEDES[step]}</Text>

      {step === 1 ? (
        <>
          <Card style={styles.card}>
            <CardSection dense first title="College email">
              <View style={styles.field}>
                <Mail size={17} color={colors.faint} strokeWidth={1.9} style={styles.fieldIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@college.edu"
                  placeholderTextColor={colors.faint}
                  selectionColor={colors.ink}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  inputMode="email"
                  onSubmitEditing={sendCode}
                  style={[textCorners('block'), styles.input]}
                  accessibilityLabel="College email"
                />
              </View>
              {emailError ? <FieldError message={emailError} /> : null}
              {isCollegeEmail(email) ? (
                <Text style={[typeScale.label, styles.hint]}>
                  {campusFromEmail(email)} · we will send a 6-digit code to this address
                </Text>
              ) : null}
            </CardSection>
          </Card>

          <PrimaryButton
            label="Send verification code"
            onPress={sendCode}
            disabled={!isCollegeEmail(email)}
            style={styles.action}
          />

          <Card muted style={styles.notice}>
            <View style={styles.noticeRow}>
              <Lock size={15} color={colors.muted} strokeWidth={1.9} />
              <Text style={[typeScale.label, styles.noticeText]}>
                CampusNow has no sign-up. Accounts are issued by your campus IT office, so only
                students with a real college identity can sign in.
              </Text>
            </View>
          </Card>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Card style={styles.card}>
            <CardSection dense first title="Verification code" description={`Sent to ${email.trim()}`}>
              <Pressable onPress={() => codeRef.current?.focus()} style={styles.otpRow}>
                {Array.from({ length: 6 }).map((_, index) => {
                  const filled = Boolean(code[index]);
                  const cursor = index === Math.min(code.length, 5);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        filled ? styles.otpBoxFilled : null,
                        cursor && !filled ? styles.otpBoxCursor : null,
                      ]}
                    >
                      <Text style={styles.otpDigit}>{code[index] ?? ''}</Text>
                    </View>
                  );
                })}
              </Pressable>

              <TextInput
                ref={codeRef}
                value={code}
                onChangeText={(value) => setCode(value.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                style={styles.hiddenInput}
                accessibilityLabel="Verification code"
              />

              {code.length === 6 ? (
                <View style={styles.codeOk}>
                  <BadgeCheck size={15} color={colors.inkSoft} strokeWidth={2} />
                  <Text style={[typeScale.label, styles.codeOkText]}>
                    {code === sentCode ? 'Code matches' : 'Code accepted for this prototype'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.codeActions}>
                {seconds > 0 ? (
                  <Text style={[typeScale.label, styles.hint]}>Resend available in {seconds}s</Text>
                ) : (
                  <TextButton label="Resend code" onPress={sendCode} align="left" />
                )}
                <TextButton label="Change email" onPress={() => setStep(1)} align="right" />
              </View>
            </CardSection>
          </Card>

          {sentCode ? (
            <Card muted style={styles.notice}>
              <View style={styles.noticeRow}>
                <ShieldCheck size={15} color={colors.muted} strokeWidth={1.9} />
                <Text style={[typeScale.label, styles.noticeText]}>
                  Prototype delivery: the code for this session is {sentCode}. The live build sends
                  it from the campus mail relay.
                </Text>
              </View>
            </Card>
          ) : null}

          <PrimaryButton
            label="Verify email"
            onPress={checkCode}
            disabled={code.length < 6}
            style={styles.action}
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Card style={styles.card}>
            <CardSection dense first title="Full name" description="Exactly as printed on your college ID">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.faint}
                selectionColor={colors.ink}
                autoCapitalize="words"
                style={[textCorners('block'), styles.inputStandalone]}
                accessibilityLabel="Full name"
              />
            </CardSection>

            <CardSection
              dense
              title="University seat number"
              description="Your USN or student ID, exactly as printed on your college card"
            >
              <TextInput
                value={usn}
                onChangeText={(value) => setUsn(normaliseUsn(value))}
                placeholder="1DS21CS001"
                placeholderTextColor={colors.faint}
                selectionColor={colors.ink}
                autoCapitalize="characters"
                autoCorrect={false}
                style={[textCorners('block'), styles.inputStandalone]}
                accessibilityLabel="University seat number"
              />
              {usnError ? <FieldError message={usnError} /> : null}
              {usn && !usnError ? (
                <Text style={[typeScale.label, styles.hint]}>
                  Stored on this device with your verified email and ID photo.
                </Text>
              ) : null}
            </CardSection>

            <CardSection dense title="College ID card" description="A photo of the card, for the campus audit trail">
              {idPhoto ? (
                <View style={styles.idRow}>
                  <Image source={{ uri: idPhoto }} style={styles.idPhoto} resizeMode="cover" />
                  <View style={styles.idCopy}>
                    <View style={styles.idOk}>
                      <BadgeCheck size={15} color={colors.inkSoft} strokeWidth={2} />
                      <Text style={[typeScale.label, styles.idOkText]}>Card captured</Text>
                    </View>
                    <TextButton label="Retake photo" onPress={() => setIdPhoto(null)} align="left" />
                  </View>
                </View>
              ) : (
                <View style={styles.idRow}>
                  <View style={styles.idPlaceholder}>
                    <IdCard size={22} color={colors.faint} strokeWidth={1.8} />
                  </View>
                  <View style={styles.idCopy}>
                    <SecondaryButton
                      label={photoBusy ? 'Opening…' : 'Take a photo'}
                      icon={<Camera size={18} color={colors.inkSoft} strokeWidth={1.9} />}
                      onPress={() => pickId('camera')}
                      disabled={photoBusy}
                      style={styles.idButton}
                    />
                    <TextButton
                      label="Upload from library"
                      onPress={() => pickId('library')}
                      align="left"
                    />
                  </View>
                </View>
              )}
            </CardSection>
          </Card>

          <PrimaryButton
            label="Verify and continue"
            onPress={() => {
              haptics.success();
              setPhase('checking');
            }}
            disabled={!canVerify}
            style={styles.action}
          />

          <Text style={[typeScale.label, styles.footnote]}>
            Your email, USN and ID photo are checked once and stored on this device. Reports you
            file carry your verified identity to the operations team.
          </Text>
        </>
      ) : null}
    </Screen>
  );
}

const TITLES: Record<Step, string> = {
  1: 'Sign in with your college email',
  2: 'Enter the code we emailed you',
  3: 'Confirm your student identity',
};

const LEDES: Record<Step, string> = {
  1: 'CampusNow is only open to enrolled students. Use the address your campus issued you.',
  2: 'This proves the account is yours before anything is filed on your behalf.',
  3: 'Operations needs to know which student filed a report, and which seat number it belongs to.',
};

/** Three segments: where you are in the check. */
function Stepper({ step }: { step: Step }) {
  return (
    <View style={styles.stepper}>
      {[1, 2, 3].map((value) => (
        <View
          key={value}
          style={[styles.stepSegment, value <= step ? styles.stepSegmentOn : null]}
        />
      ))}
      <Text style={[typeScale.label, styles.stepText]}>Step {step} of 3</Text>
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.errorRow}>
      <AlertCircle size={14} color={colors.critical} strokeWidth={2} />
      <Text style={[typeScale.label, styles.errorText]}>{message}</Text>
    </View>
  );
}

/** The pause between "verify" and Home: identity check, then a confirmation. */
function Verifying({ phase }: { phase: Phase }) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.6)) });
    opacity.value = withTiming(1, { duration: 320 });
  }, [opacity, scale]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.verifying}>
      <Animated.View style={[styles.verifyingMark, markStyle]}>
        {phase === 'verified' ? (
          <Check size={28} color={colors.onSolid} strokeWidth={2.4} />
        ) : (
          <ActivityIndicator color={colors.onSolid} />
        )}
      </Animated.View>
      <Text style={[typeScale.heading, styles.verifyingTitle]}>
        {phase === 'verified' ? 'Identity verified' : 'Checking your details'}
      </Text>
      <Text style={[typeScale.meta, styles.verifyingText]}>
        {phase === 'verified'
          ? 'Welcome to CampusNow — taking you to your campus.'
          : 'Matching your USN with your campus records…'}
      </Text>
    </View>
  );
}

const styles = createStyles(() => ({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  brandName: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 26,
  },
  stepSegment: {
    flex: 1,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.surfaceSunken,
  },
  stepSegmentOn: {
    backgroundColor: colors.ink,
  },
  stepText: {
    marginLeft: 6,
    fontSize: 11.5,
  },
  title: {
    marginTop: 22,
  },
  lede: {
    marginTop: 6,
  },
  card: {
    marginTop: 18,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 48,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fieldIcon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 46,
    padding: 0,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 14.5,
    outlineWidth: 0,
  },
  inputStandalone: {
    height: 46,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    outlineWidth: 0,
  },
  hint: {
    marginTop: 8,
    color: colors.muted,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    color: colors.critical,
  },
  action: {
    marginTop: 16,
  },
  notice: {
    marginTop: 14,
  },
  /** The muted callouts are read as one block: even padding on all four
   *  sides and type a step below the body copy. */
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17.5,
    color: colors.muted,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  otpBoxFilled: {
    borderColor: colors.lineStrong,
    backgroundColor: colors.surfaceMuted,
  },
  otpBoxCursor: {
    borderColor: colors.inkSoft,
  },
  otpDigit: {
    fontFamily: fontFamily.semibold,
    fontSize: 19,
    color: colors.ink,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -999,
  },
  codeOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  codeOkText: {
    color: colors.ink,
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  idRow: {
    flexDirection: 'row',
    gap: 12,
  },
  idPhoto: {
    width: 92,
    height: 62,
    borderWidth: 1,
    borderColor: colors.line,
  },
  idPlaceholder: {
    width: 92,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  idCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  idOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  idOkText: {
    color: colors.ink,
  },
  idButton: {
    height: 42,
  },
  footnote: {
    marginTop: 14,
    lineHeight: 19,
  },
  verifying: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.background,
  },
  verifyingMark: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.solid,
  },
  verifyingTitle: {
    marginTop: 18,
  },
  verifyingText: {
    marginTop: 4,
    textAlign: 'center',
  },
}));
