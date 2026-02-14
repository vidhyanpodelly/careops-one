import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const isWorkspaceActive = async () => {
  const snap = await getDoc(doc(db, "workspace", "main"));
  if (!snap.exists()) return false;

  const data = snap.data();
  return data?.active === true;
};
