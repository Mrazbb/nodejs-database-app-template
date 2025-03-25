
#/bin/sh
export SSH_AUTH_SOCK=$(ls -t /tmp/ssh-**/* | head -1)
export SSH_AUTH_SOCK=$(ls -t /tmp/ssh-**/* | head -1)
export SSH_AUTH_SOCK=$(ls -t /tmp/ssh-**/* | head -1)
git pull
git fetch primaleto-cms
grep -v '^#' .migrate | xargs git checkout --force primaleto-cms/main --



# git checkout --force primaleto-cms/main -- cms/definitions/shared
# git clean -fd cms/definitions/shared
# 

# REPLACe all files in the current branch with the files from the primaleto-cms/main branch
# git restore --source=primaleto-cms/main -- cms/definitions

# make sure that scripts are executable
chmod +x ./tasks/*