import { Group } from "../models/groupModel.js";
import { User } from "../models/userModel.js";

export async function createNewGroup(req, res) {
  const { name, description, admin, invited } = req.body;

  if (!req.valideUser) {
    return res.status(401).send("Unauthorized Request.");
  }

  if (!name || !name.trim()) {
    return res.status(400).send("Group name is required.");
  }
  if (!description || !description.trim()) {
    return res.status(400).send("Group description is required.");
  }
  if (!admin) {
    return res.status(400).send("Admin ID is required.");
  }
  if (!invited || invited.length < 2) {
    return res.status(400).send("At least two members must be invited.");
  }
 
  try {
    const newGroup = await Group.create({
      name: name,
      description: description,
      admin,
      members: invited,
    });

    // Add the new group to the admin's groups array
    await User.findByIdAndUpdate(admin, {
      $push: { groups: newGroup._id },
    });

    // Add the new group to each invited user's groups array
    await Promise.all(
      invited.map((userId) =>
        User.findByIdAndUpdate(userId, {
          $push: { groups: newGroup._id },
        })
      )
    );

    return res.status(200).json(newGroup);
  } catch (error) {
    console.error("Error in creating a group:", error);
    return res.status(500).send("Internal server error while creating a group.");
  }
}
