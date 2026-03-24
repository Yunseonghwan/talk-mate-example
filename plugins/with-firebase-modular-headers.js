const { createRunOncePlugin, withDangerousMod } = require("@expo/config-plugins");

/**
 * Firebase Swift pods(FirebaseCoreInternal 등)가 GoogleUtilities를 정적 라이브러리로 쓸 때
 * 모듈 맵이 필요합니다. Podfile에 `use_modular_headers!` 를 추가합니다.
 * @see https://github.com/invertase/react-native-firebase/issues/6332
 */
function withFirebaseModularHeadersImpl(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const fs = require("fs/promises");
      const path = require("path");
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "Podfile",
      );
      let contents = await fs.readFile(podfilePath, "utf8");
      const marker = "# @generated expo-plugin-firebase-modular-headers";
      if (contents.includes(marker)) {
        return cfg;
      }
      const block = `
${marker}
use_modular_headers!
`;
      if (contents.includes("platform :ios")) {
        contents = contents.replace(/(platform :ios[^\n]*\n)/, `$1${block}`);
      } else {
        contents = `${block}\n${contents}`;
      }
      await fs.writeFile(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withFirebaseModularHeadersImpl,
  "with-firebase-modular-headers",
  "1.0.0",
);
