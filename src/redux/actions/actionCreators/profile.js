/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
import '@babel/polyfill';
import dotenv from 'dotenv';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import {
  GET_PROFILE,
  PROFILE_ERROR,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
} from '../actionTypes/profile';
import {
  checkToken,
} from '../../../utils/checkToken';
import {
  setAlert,
} from './alert';
import store from '../../store';
import {
  setCurrentUser,
} from './login';

dotenv.config();

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const performAction = (type, payload) => ({
  type,
  payload,
});

export const getCurrentProfile = () => async (dispatch) => {
  checkToken();
  try {
    const uname = store.dispatch(setCurrentUser(jwtDecode(localStorage.getItem('jwtToken'))));
    const {
      username,
    } = uname.user;
    const res = await axios.get(`${process.env.APP_URL_BACKEND}/api/profiles/${username}`);
    dispatch(performAction(GET_PROFILE, res.data));
  } catch (error) {
    dispatch(performAction(PROFILE_ERROR, error.response));
  }
};

export const updateProfile = (profileData, history) => async (dispatch) => {
  checkToken();
  try {
    const formData = new FormData();
    const keys = Object.keys(profileData);
    const values = Object.values(profileData);
    keys.map((name, index) => {
      formData.append(`${name}`, values[index]);
    });

    const res = await axios.patch(`${process.env.APP_URL_BACKEND}/api/profiles`, formData, config);
    localStorage.setItem('profileImage', res.data.profile.image);
    dispatch(performAction(UPDATE_PROFILE_SUCCESS, res.data));
    dispatch(setAlert('Profile successfully updated.', 'success'));
    history.push('/profile');
  } catch (error) {
    if (error.response) {
      dispatch(performAction(UPDATE_PROFILE_FAIL, error.response.data));
      dispatch(setAlert(error.response.data.error, 'danger'));
    }
  }
};
