import unittest
import sys
sys.path.insert(0, "/")  # Add the workspace root to Python path
from SLA113.core.kernel.boundary_enforcement import SLA113Kernel
import os
import sqlite3

class TestBoundaryEnforcement(unittest.TestCase):

    def setUp(self):
        self.kernel = SLA113Kernel()
        # Clear ledger entries before test run
        conn = sqlite3.connect(self.kernel.db_path)
        conn.execute("DELETE FROM ledger_entries")
        conn.commit()
        conn.close()

    def test_ledger_balance_integrity(self):
        """Test that ledger balances are computed correctly."""
        self.kernel.record_transaction(113, debit=100, credit=0)
        self.kernel.record_transaction(113, debit=0, credit=50)
        balance = self.kernel.get_ledger_balance(113)
        self.assertEqual(balance, 50, "Ledger balance computation failed!")

    def test_rtp_drift_detection(self):
        """Test RTP drift detection."""
        self.kernel.record_transaction(113, debit=3000, credit=0)
        rtp_state = self.kernel.get_reactive_rtp(113)
        self.assertIn(rtp_state, [0.88, 0.94], "RTP state drift detected!")

    def test_integrity_check(self):
        """Test system integrity validation."""
        integrity = self.kernel.verify_integrity()
        self.assertTrue(integrity['seed_rotation'], "Seed rotation path missing.")
        self.assertTrue(integrity['ledger_accessible'], "Ledger database missing.")

if __name__ == "__main__":
    unittest.main()