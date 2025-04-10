import { useEffect } from "react";
import WelcomeScreen from "./pages/Auth/WelcomeScreen";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Starter from "./pages/Chats/Starter";
import ProfileSetup from "./components/Setting/ProfileSetup";
import Home from "./pages/Chats/Home";
import PrivateRoutes from "./components/Secure/PrivateRoutes";
import ChatRoom from "./pages/Chats/ChatRoom";
import CreateGroup from "./pages/Groups/CreateGroup";
import GroupRoom from "./pages/Groups/GroupRoom";
import { SocketProvider } from "./context/SocketProvider";
import Search from "./components/Search/Search";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import "./i18n";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <Routes> 
            <Route path="/" element={<Starter />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />}/>
            <Route path="/reset-password/:userId" element={<ResetPassword />}/>
            <Route path="/user/profile-setup" element={<ProfileSetup />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route element={<PrivateRoutes />}>
              <Route path="/textup" element={<Home />} />
              <Route path="/textup/chats/:userId" element={<ChatRoom />} />
              <Route path="/textup/chats/:callerId/:calleeId/:callOption" element={<ChatRoom />} />
              <Route path="/textup/groups/create" element={<CreateGroup />} />
              <Route path="/textup/groups/:groupId" element={<GroupRoom />} />
            </Route>
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
