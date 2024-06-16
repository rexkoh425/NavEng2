const express = require('express');
const myRouter = require('./routes/router');

const app = express();
app.use(express.json());

app.use(myRouter);

module.exports = app;

/*
app.use(myRouter.router);



module.exports = {
    app,
    template_img: myRouter.template_img,
    NESW_ENUM: myRouter.NESW_ENUM,
    get_pov: myRouter.get_pov,
    handle_up_down: myRouter.handle_up_down,
    get_arrow_dir: myRouter.get_arrow_dir,
    is_moving_up_down: myRouter.is_moving_up_down,
    room_num_to_node_id: myRouter.room_num_to_node_id,
    get_diff: myRouter.get_diff
};
*/
