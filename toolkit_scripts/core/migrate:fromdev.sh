#/bin/sh


# migrate form dev to prod
export SSH_AUTH_SOCK=$(ls -t /tmp/ssh-**/* | head -1)



git pull
git fetch origin main


# replace and remove
grep -v '^#' .migrate_from_dev_to_prod | xargs git restore --source=origin/main -- 

# create name for commit


# replace and keep
# grep -v '^#' .migrate_from_dev_to_prod | xargs git checkout --force origin/main --


# make sure that scripts are executable
chmod +x ./scripts/*