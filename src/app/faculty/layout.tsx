import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@/types';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.FACULTY]}>
      {children}
    </RoleGuard>
  );
}
