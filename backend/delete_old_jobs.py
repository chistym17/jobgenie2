from app.services.jobs import delete_jobs_older_than

if __name__ == "__main__":
    delete_jobs_older_than(7)
