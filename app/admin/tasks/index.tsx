import { Redirect } from "expo-router";

export default function TasksIndex() {
  return <Redirect href="/admin/tasks/tabs/assignments" />;
}
