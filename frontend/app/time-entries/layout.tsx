import DashboardLayout from "../../components/layout/DashboardLayout";

export default function TimeEntriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
