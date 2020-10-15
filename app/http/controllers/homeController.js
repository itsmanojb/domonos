const Menu = require('../../models/menu');

function homeController() {
  return {
    async index(req, res) {
      const allMenus = await Menu.find();

      allMenus.forEach(menu => {
        const data = menu.toObject();
        console.log(data);
      })

      const menus = allMenus.reduce((menus, item) => {
        const group = (menus[item.menuType] || []);
        group.push(item);
        menus[item.menuType] = group;
        return menus;
      }, {});

      const veg = [],
        nonveg = [];
      const shuffled = menus.pizza.sort(() => 0.5 - Math.random());

      menus.pizza.map(item => {
        if (item.foodType === 'veg') {
          veg.push(item);
        } else {
          nonveg.push(item);
        }
      });

      // res.json(menus)

      res.render('home', {
        menus: {
          ...menus,
          veg,
          nonveg,
          topMenu: shuffled.slice(0, 12)
        }
      });
    },
  };
}

module.exports = homeController;