package net.tfassbender.gameplan.persistence;

import net.tfassbender.gameplan.exception.GamePlanPersistenceException;

import java.util.List;

public interface UserService {

  List<String> getUsers() throws GamePlanPersistenceException;
  void createUser(String name) throws GamePlanPersistenceException;
  boolean userExists(String name) throws GamePlanPersistenceException;
}
