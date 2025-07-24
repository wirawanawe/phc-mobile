declare module "react-native-vector-icons/MaterialCommunityIcons" {
  import { Component } from "react";
  import { TextProps } from "react-native";

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class MaterialCommunityIcons extends Component<IconProps> {}
}

declare module "react-native-vector-icons/MaterialIcons" {
  import { Component } from "react";
  import { TextProps } from "react-native";

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class MaterialIcons extends Component<IconProps> {}
}
