# Bold 

### Instalation process

- clone this repository
- composer update
- copy .env.example to .env
- configure database access
	- choosing sqlite, create an empty file: database/database.sqlite
- php artisan key:generate
- php migrate --seed
- php artisan serve

Login: admin@admin.com
Password: admin


### Development 

Vue files are on the /frontend folder

- yarn / npm install
- yarn serve / npm run serve




