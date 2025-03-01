const createUserController = (userService) => ({

  createUser: tryCatch(async (req, res) => {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  }),


  getUserById: tryCatch(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    res.status(200).json(user);
  }),

  updateUser: tryCatch(async (req, res) => {
    const updatedUser = await userService.updateUser(req.params.userId, req.body);
    res.status(200).json(updatedUser);
  }),


  deleteUser: tryCatch(async (req, res) => {
    const response = await userService.deleteUser(req.params.userId);
    res.status(200).json(response);
  }),

  getAllUsers: tryCatch(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  }),
});


const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

export default createUserController;
