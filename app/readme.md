## Database helper scripts

[Database](docs/database.md)



## directories for customer front
/private


# files
# watermark

file name

images_(GUID)$w=langcountryid&w=400&h=400.webp


# git
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_2024
export SSH_AUTH_SOCK=$(ls -t /tmp/ssh-**/* | head -1)


# move files from primaleto-cms to project
git remote add primaleto-cms git@github.com:Mrazbb/primaleto-cms.git
git fetch primaleto-cms
grep -v '^#' .migrate | xargs git checkout primaleto-cms/main --
git push

# save data from table

pg_dump --table=public.cl_structure_type --data-only --column-inserts my_database > data.sql
