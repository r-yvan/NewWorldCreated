import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
} from "react-native";
import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold,
} from "@expo-google-fonts/raleway";

/** Raleway weights loaded at startup and consumed via `useFonts`. */
export const ralewayFonts = {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold,
} as const;

/** Maps a resolved RN fontWeight to the matching Raleway font file. */
function familyForWeight(weight?: string | number): string {
  switch (String(weight ?? "400")) {
    case "500":
      return "Raleway_500Medium";
    case "600":
      return "Raleway_600SemiBold";
    case "700":
    case "bold":
      return "Raleway_700Bold";
    case "800":
    case "900":
      return "Raleway_800ExtraBold";
    default:
      return "Raleway_400Regular";
  }
}

let patched = false;

/**
 * Forces every <Text>/<TextInput> in the app to render in Raleway, picking the
 * correct weighted font file based on the resolved fontWeight. Runs once.
 */
export function applyGlobalRalewayFont(): void {
  if (patched) return;
  patched = true;

  for (const Component of [RNText, RNTextInput] as const) {
    const target = Component as unknown as {
      render?: (...args: unknown[]) => any;
    };
    const originalRender = target.render;
    if (typeof originalRender !== "function") continue;

    target.render = function patchedRender(...args: unknown[]) {
      const element = originalRender.apply(this, args);
      if (!element) return element;

      const flattened = StyleSheet.flatten(element.props?.style) ?? {};
      const fontFamily =
        flattened.fontFamily ?? familyForWeight(flattened.fontWeight);

      // The chosen Raleway file already carries the weight, so clear fontWeight
      // to prevent the OS from faux-bolding on top of it.
      return {
        ...element,
        props: {
          ...element.props,
          style: [element.props?.style, { fontFamily, fontWeight: "normal" }],
        },
      };
    };
  }
}
