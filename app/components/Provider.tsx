"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function Provider(props: { children: React.ReactNode }) {
  return <Authenticator>{props.children}</Authenticator>;
}
