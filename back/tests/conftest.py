import os

# Must be set before src.database (engine) initializes.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
