import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import DatePicker from '@mui/lab/DatePicker';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Switch, Typography, FormControlLabel, TextField } from '@mui/material';
// utils
import { fData } from '../../../utils/formatNumber';
import { capitalizeFirstLetter } from '../../../utils/capitalize';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import Label from '../../../components/Label';
import {
  FormProvider,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFUploadSingleFile,
} from '../../../components/hook-form';
// services
import { newTaskFunc, getTasksFunc, editTaskFunc } from '../../../redux/slices/task'
import { dispatch, store } from '../../../redux/store';

// ----------------------------------------------------------------------
const CATEGORIES = [
  { value: 'research', label: 'Research', code: 1 },
  { value: 'health', label: 'Health', code: 2 },
  { value: 'education', label: 'Education', code: 3 },
  { value: 'it', label: 'IT', code: 4 },
  { value: 'development', label: 'Development', code: 5 },
];
const PRIORITIES = [
  { value: 'high', label: 'High', code: 1 },
  { value: 'medium', label: 'Medium', code: 2 },
  { value: 'low', label: 'Low', code: 3 },
];
// ----------------------------------------------------------------------

TaskNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentTask: PropTypes.object,
};

export default function TaskNewEditForm({ isEdit, currentTask }) {

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const NewTaskSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    category: Yup.string().required('Category is required'),
    priority: Yup.string().required('Priority is required'),
    dueDate: Yup.string().required('Due Date is required'),
    description: Yup.string().required('Description is required'),

    // name: Yup.string().required('Name is required'),
    // email: Yup.string().required('Email is required').email(),
    // phoneNumber: Yup.string().required('Phone number is required'),
    // address: Yup.string().required('Address is required'),
    // country: Yup.string().required('country is required'),
    // company: Yup.string().required('Company is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // role: Yup.string().required('Role Number is required'),
    // avatarUrl: Yup.mixed().test('required', 'Avatar is required', (value) => value !== ''),
  });

  const [task, setTask] = useState({});
  const taskArray = useSelector(state => state.task.task);
  useEffect(() => {
    if(isEdit) {
      setTask(taskArray)
    } else {
      setTask({})
    }
  }, [])

  const defaultValues = useMemo(
    () => ({
      title: task?.title || '',
      category: capitalizeFirstLetter(task?.category) || '',
      priority: capitalizeFirstLetter(task?.priority) || '',
      dueDate: task?.dueDate || '',
      description: task?.description || '',
      // name: currentTask?.name || '',
      // email: currentTask?.email || '',
      // phoneNumber: currentTask?.phoneNumber || '',
      // address: currentTask?.address || '',
      // country: currentTask?.country || '',
      // state: currentTask?.state || '',
      // city: currentTask?.city || '',
      // zipCode: currentTask?.zipCode || '',
      // avatarUrl: currentTask?.avatarUrl || '',
      // isVerified: currentTask?.isVerified || true,
      // status: currentTask?.status,
      // company: currentTask?.company || '',
      // role: currentTask?.role || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task]
  );

  const methods = useForm({
    resolver: yupResolver(NewTaskSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  /* Get tasks */
  /* useEffect(() => {
    getTasksFunc();
  }, []) */

  useEffect(() => {
    if (isEdit && task) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, task]);

  const onSubmit = async (data) => {
    try {
      if(!isEdit) {
        dispatch(newTaskFunc(data))
      } else {
        const editedTask = {};
        editedTask.title = data.title;
        editedTask.category = data.category.toLowerCase();
        editedTask.priority = data.priority.toLowerCase();
        editedTask.endDate = data.dueDate;
        editedTask.description = data.description;
        dispatch(editTaskFunc(task.id, editedTask))
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_DASHBOARD.clientTask.list);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          'attachment',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {/* <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3 }}>
            {isEdit && (
              <Label
                color={values.status !== 'active' ? 'error' : 'success'}
                sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 2,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {isEdit && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) => field.onChange(event.target.checked ? 'banned' : 'active')}
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Banned
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            <RHFSwitch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email Verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the task a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Card>
        </Grid> */}

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="title" label="Title" />

              <RHFSelect name="category" label="Category" placeholder="Country">
                <option value="" />
                {CATEGORIES.map((option) => (
                  <option key={option.code} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>
              <RHFSelect name="priority" label="Priority" placeholder="Country">
                <option value="" />
                {PRIORITIES.map((option) => (
                  <option key={option.code} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>
              {/* <RHFTextField name="dueDate" label="Due Date" /> */}
              <Controller
                name="dueDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Due Date"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Box>

            <Stack spacing={3} mt={3}>
              <RHFTextField
                name="description"
                placeholder="Please explain the task like you are telling someone face to face."
                label="Description"
                multiline
                rows={5}
              />

              <div>
                <RHFUploadSingleFile name="attachment" accept="image/*" maxSize={3145728} onDrop={handleDrop} />
              </div>
            </Stack>
            <Stack Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
              {!isEdit ? (
                <LoadingButton color="inherit" variant="contained" loading={isSubmitting}>
                  Save as draft
                </LoadingButton>
              ) : (
                ''
              )}
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create Task' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
