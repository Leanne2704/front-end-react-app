# Front End React

Start with a log in box that allows a user to log in.

Depending on the user type they will see a different home screen.
The home screen will be a list of data. The user may or may not see buttons, depending on their assigned role.

ADMIN -> sees add user, add job and log out.
MANAGER -> SEES ADD JOB AND LOG OUT
USER -> SEE'S LOG OUT.

# Same info as back end repo:

### Front End

Built in React, New Repo.
We will have the log in box for email and password.
This will be sent to the back end to check.
When use is authenticated, we check what they have access to.

If they are 'admin' role
They can see all store branches.

If they are 'manager' role they can only see their branch.

If they are 'worker' role they can only see their information.

# Data set up

So we will need a table to save users and their roles.
A table to save user and password
A table to save store locations -> Branch A, Branch B
A table to save Jobs -> Each job has a location and a 'worker' (user)

So when an admin logs in, they can see all the data of all of the jobs and all the 'workers' assigned.
They can click on a button which will take them to a 'new user sign up page' to add a new user.
They can see a button that says 'assign job' and they can assign a job to any shop or staff member.

When a 'manager' logs in, they can see all jobs assigned to their shop.
They can see a button that says assign job -> But they can only see users allocated to their location.

When a worker logs in, they can only see their jobs.

# What we need to do is get the appropriate data for the user displaying on the home page.

# Allow the userto click buttons, depending on their role, fill in data and send it back to the database.

# We want to test the system works with unit tests and playright.
