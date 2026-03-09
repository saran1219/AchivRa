import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@/types';

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.VERIFICATION_TEAM]}>
      {children}
    </RoleGuard>
  );
}
