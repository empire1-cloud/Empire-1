import unittest
import sys
sys.path.insert(0, "/")  # Add the workspace root to Python path
from SLA113.core.kernel.tenant_isolation import BusinessIsolation
import os

class TestTenantIsolation(unittest.TestCase):

    def test_validate_boundary_valid(self):
        """Test validate_boundary accepts valid tenant IDs."""
        try:
            BusinessIsolation.validate_boundary(113)
            BusinessIsolation.validate_boundary(1)
            self.assertTrue(True)  # No exception should mean valid
        except:
            self.fail("validate_boundary raised Exception for valid IDs!")

    def test_validate_boundary_invalid(self):
        """Test validate_boundary rejects invalid tenant IDs."""
        with self.assertRaises(SystemError):
            BusinessIsolation.validate_boundary(999)

    def test_drift_logging(self):
        """Test that boundary violations are logged as drifts."""
        try:
            log_path = "/SLA113/logs/drift_events.log"
            # Ensure log directory exists
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            if os.path.exists(log_path):
                os.remove(log_path)  # Begin fresh

            # Trigger violation
            with self.assertRaises(SystemError):
                BusinessIsolation.validate_boundary(999)

            # Validate log content
            self.assertTrue(os.path.exists(log_path), "Drift log not created.")
            with open(log_path, "r") as f:
                logs = f.readlines()
                self.assertTrue(any("Boundary violation detected" in log for log in logs), "Expected log message missing.")

        except Exception as e:
            self.fail(f"Drift log test failed: {e}")

if __name__ == "__main__":
    unittest.main()