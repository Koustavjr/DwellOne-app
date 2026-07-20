import { useGoogleSignIn } from "@/utils/auth";
import { Button, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/store/use-auth";
import { routeAfterAuth } from "@/utils/routeAfterAuth";
import { useRouter } from "expo-router";

export default function Index() {
  const { signInWithGoogle } = useGoogleSignIn();
  const { signOut, user } = useAuthStore();
  // const signOut = async () => {
  //   await supabase.auth.signOut()
  // }
  const router = useRouter()
  return (
    <View style={styles.container}>
      {user?.id ? (
        <>
          <Button title="Sign out" onPress={signOut} />
          <Button title="Go to  dashboard" onPress={async () => await routeAfterAuth(router)} /></>
      ) : (
        <Button title="Sign in with Google" onPress={signInWithGoogle} />
      )}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
