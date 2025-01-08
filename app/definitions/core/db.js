require('dbms').init("postgresql://" + CONF.postgres, ERROR('DBMS'));

require('querybuilderpg').init('', "postgresql://" + CONF.postgres, CONF.pooling || 1, ERROR('PostgreSQL'));