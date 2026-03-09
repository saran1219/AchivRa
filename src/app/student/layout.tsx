import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@/types';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.STUDENT]}>
      {children}
    </RoleGuard>
  );
}
