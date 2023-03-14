import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Stack,
  Table,
  Switch,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useTabs from '../../hooks/useTabs';
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// _mock_
import { _tasks } from '../../_mock';
// components
import Label from '../../components/Label';
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableEmptyRows, TableHeadCustom, TableNoData, TableSelectedActions } from '../../components/table';
// sections
import { TaskTableToolbar, TaskTableRow } from '../../sections/@dashboard/clienttask/list';
import TaskAnalytic from '../../sections/@dashboard/task/TaskAnalytic';

import { deleteTaskFunc, deleteTasksFunc, getTasksFunc, setTask } from '../../redux/slices/task'
import { dispatch, store } from '../../redux/store';

// ----------------------------------------------------------------------

// const STATUS_OPTIONS = ['all', 'active', 'banned'];
const STATUS_OPTIONS = ['active', 'pending', 'completed', 'draft'];

const CATEGORIES = ['all', 'research', 'health', 'education', 'it', 'development'];
const TABLE_HEAD = [
  { id: 'taskNumber', label: 'Title', align: 'left' },
  { id: 'category', label: 'Category', align: 'left' },
  { id: 'createDate', label: 'Date Submitted', align: 'left' },
  { id: 'dueDate', label: 'Due on', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];
// const TABLE_HEAD = [
//   { id: 'name', label: 'Name', align: 'left' },
//   { id: 'company', label: 'Company', align: 'left' },
//   { id: 'role', label: 'Role', align: 'left' },
//   { id: 'isVerified', label: 'Verified', align: 'center' },
//   { id: 'status', label: 'Status', align: 'left' },
//   { id: '' },
// ];

// ----------------------------------------------------------------------

export default function ClientTaskList() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const [ tasks, setTasks ] = useState([]);
  const [ reRender, setRerender ] = useState(true);

  const tasksArray = useSelector(state => state.task.tasks);
  
  useEffect(async () => {
    if(reRender) {
      await dispatch(getTasksFunc())
      setTasks(tasksArray)
      setRerender(false)
    }
  }, [tasksArray])

  const { themeStretch } = useSettings();

  const theme = useTheme();

  const navigate = useNavigate();

  const [tableData, setTableData] = useState(_tasks);

  const [filterName, setFilterName] = useState('');

  const [filterCategory, setFilterCategory] = useState('all');
  const { currentTab: filterStatus, onChangeTab: onFilterStatus } = useTabs('all');
  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleFilterCategory = (event) => {
    setFilterCategory(event.target.value);
  };

  const handleDeleteRow = async (id) => {
    const res = await dispatch(deleteTaskFunc(id));
    setTasks(res);
    setSelected([])
  };

  const handleDeleteRows = async (selected) => {
    const res = await dispatch(deleteTasksFunc(selected))
    setTasks(res);
    setSelected([])
  };

  const handleEditRow = (id) => {
    const task = tasks.filter(task => task.id === id)[0];
    dispatch(setTask(task));
    navigate(PATH_DASHBOARD.clientTask.edit(paramCase(id)));
    setRerender(true);
  };

  const dataFiltered = applySortFilter({
    tasks,
    comparator: getComparator(order, orderBy),
    filterName,
    filterCategory,
    filterStatus,
  });
  const getLengthByStatus = (status) => tasks.filter((item) => item.status === status).length;
  const getPercentByStatus = (status) => (getLengthByStatus(status) / dataFiltered.length) * 100;

  const denseHeight = dense ? 52 : 72;

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterCategory) ||
    (!dataFiltered.length && !!filterStatus);
  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: tasks.length },
    { value: 'active', label: 'Active', color: 'default', count: getLengthByStatus('active') },
    { value: 'pending', label: 'Pending', color: 'warning', count: getLengthByStatus('pending') },
    { value: 'completed', label: 'Completed', color: 'success', count: getLengthByStatus('completed') },
    { value: 'cancelled', label: 'Cancelled', color: 'error', count: getLengthByStatus('cancelled') },
    { value: 'draft', label: 'Draft', color: 'warning', count: getLengthByStatus('draft') },
  ];
  return (
    <Page title="Task: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Task List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.general.clientApp },
            { name: 'Task', href: PATH_DASHBOARD.clientTask.root },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.clientTask.new}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              New Task
            </Button>
          }
        />
        <Card sx={{ mb: 5 }}>
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <TaskAnalytic
                title="All"
                total={tasks.length}
                percent={100}
                // price={sumBy(tableData, 'totalPrice')}
                icon="ic:round-receipt"
                color={theme.palette.text.secondary}
              />
              <TaskAnalytic
                title="Active"
                total={getLengthByStatus('active')}
                percent={getPercentByStatus('active')}
                // price={getTotalPriceByStatus('paid')}
                icon="eva:bell-fill"
                color={theme.palette.info.main}
              />
              <TaskAnalytic
                title="Pending"
                total={getLengthByStatus('pending')}
                percent={getPercentByStatus('pending')}
                // price={getTotalPriceByStatus('unpaid')}
                icon="eva:clock-fill"
                color={theme.palette.warning.main}
              />
              <TaskAnalytic
                title="Completed"
                total={getLengthByStatus('completed')}
                percent={getPercentByStatus('completed')}
                // price={getTotalPriceByStatus('overdue')}
                icon="eva:checkmark-circle-2-fill"
                color={theme.palette.success.main}
              />
              <TaskAnalytic
                title="Cancelled"
                total={getLengthByStatus('cancelled')}
                percent={getPercentByStatus('cancelled')}
                // price={getTotalPriceByStatus('draft')}
                icon="eva:file-fill"
                color={theme.palette.error.main}
              />
            </Stack>
          </Scrollbar>
        </Card>
        <Card>
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={filterStatus}
            onChange={onFilterStatus}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            {TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                value={tab.value}
                label={
                  <Stack spacing={1} direction="row" alignItems="center">
                    <div>{tab.label}</div> <Label color={tab.color}> {tab.count} </Label>
                  </Stack>
                }
              />
            ))}
          </Tabs>
          {/* <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={filterStatus}
            onChange={onChangeFilterStatus}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            {TABS.map((tab) => (
              <Tab disableRipple key={tab} label={tab} value={tab} />
            ))}
          </Tabs> */}

          <Divider />

          <TaskTableToolbar
            filterName={filterName}
            filterCategory={filterCategory}
            onFilterName={handleFilterName}
            onFilterCategory={handleFilterCategory}
            optionsCategory={CATEGORIES}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={dataFiltered.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                  actions={
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={() => handleDeleteRows(selected)}>
                        <Iconify icon={'eva:trash-2-outline'} />
                      </IconButton>
                    </Tooltip>
                  }
                />
              )}

              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />
                {/* {console.log(dataFiltered)}  */}
                <TableBody>
                  {dataFiltered?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TaskTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                    />
                  ))}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)} />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataFiltered.length} /* TODO: Change value to 'tasks' */
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />

            <FormControlLabel
              control={<Switch checked={dense} onChange={onChangeDense} />}
              label="Dense"
              sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ tasks, comparator, filterName, filterStatus, filterCategory }) {
  const stabilizedThis = tasks.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tasks = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tasks = tasks.filter(
      (item) =>
        item.taskNumber.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        item.taskTo.task.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    tasks = tasks.filter((item) => item.status === filterStatus);
  }
  if (filterCategory !== 'all') {
    tasks = tasks.filter((item) => item.category === filterCategory);
  }

  return tasks;
}
