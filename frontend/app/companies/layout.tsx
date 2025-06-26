import DashboardLayout from "../../components/layout/DashboardLayout";

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
