import { AuthProvider } from '@/context/AuthContext';
import { CycleProvider } from '@/context/CycleContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { Viewport } from '@/components/Viewport';

export default function Home() {
  return (
    <AuthProvider>
      <CycleProvider>
        <WorkoutProvider>
          <Viewport />
        </WorkoutProvider>
      </CycleProvider>
    </AuthProvider>
  );
}
