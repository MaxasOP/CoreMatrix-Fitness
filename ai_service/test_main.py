import unittest

from fastapi.testclient import TestClient

from main import app, calculate_angle


class AiServiceTests(unittest.TestCase):
    def test_health(self):
        response = TestClient(app).get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_calculate_right_angle(self):
        self.assertAlmostEqual(calculate_angle([1, 0], [0, 0], [0, 1]), 90.0)


if __name__ == '__main__':
    unittest.main()
