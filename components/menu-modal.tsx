import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Layout, Spacing } from "@/constants/theme";

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
};

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
};

export function MenuModal({
  visible,
  onClose,
  items,
}: MenuModalProps): JSX.Element {
  const handleItemPress = (item: MenuItem): void => {
    item.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => handleItemPress(item)}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={Colors.light.textTertiary}
              />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Layout.horizontalPadding,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 280,
    paddingVertical: Spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  menuItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});
